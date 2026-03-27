locals {
  nats_url = "nats://nats.${var.project_name}.internal:4222"
}

resource "aws_service_discovery_private_dns_namespace" "internal" {
  name = "${var.project_name}.internal"
  vpc  = var.vpc_id
}

resource "aws_service_discovery_service" "nats" {
  name = "nats"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.internal.id
    routing_policy = "MULTIVALUE"

    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "ECS services security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "API from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  ingress {
    description = "Internal ECS traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "task_execution" {
  name = "${var.project_name}-ecs-task-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "task_execution_role_policy" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name = "${var.project_name}-ecs-task-execution-secrets"
  role = aws_iam_role.task_execution.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [var.db_secret_arn]
      }
    ]
  })
}

resource "aws_iam_role" "task_role" {
  name = "${var.project_name}-ecs-task-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_ecs_cluster" "ecs" {
  name = var.project_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "nats" {
  family                   = "${var.project_name}-nats"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "nats"
      image     = "nats:2.12-alpine"
      essential = true
      command   = ["-js", "-m", "8222"]

      portMappings = [
        {
          containerPort = 4222
          protocol      = "tcp"
        },
        {
          containerPort = 8222
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "nats"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "nats" {
  name            = "${var.project_name}-nats"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.nats.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.nats.arn
  }
}

resource "aws_ecs_task_definition" "market_data" {
  family                   = "${var.project_name}-market-data"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "market-data"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      command = [
        "python",
        "-m",
        "services.market_data.main"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "market-data"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "market_data" {
  name            = "${var.project_name}-market-data"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.market_data.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "strategy" {
  family                   = "${var.project_name}-strategy"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "strategy"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      command = [
        "python",
        "-m",
        "services.strategy_engine.main"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "strategy"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "strategy" {
  name            = "${var.project_name}-strategy"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.strategy.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "risk" {
  family                   = "${var.project_name}-risk"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "risk"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      command = [
        "python",
        "-m",
        "services.risk_engine.main"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "risk"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "risk" {
  name            = "${var.project_name}-risk"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.risk.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "execution" {
  family                   = "${var.project_name}-execution"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "execution"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      command = [
        "python",
        "-m",
        "services.execution_simulator.main"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "execution"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "execution" {
  name            = "${var.project_name}-execution"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.execution.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "portfolio" {
  family                   = "${var.project_name}-portfolio"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn

  container_definitions = jsonencode([
    {
      name      = "portfolio"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      command = [
        "python",
        "-m",
        "services.portfolio.main"
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "portfolio"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "portfolio" {
  name            = "${var.project_name}-portfolio"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.portfolio.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task_role.arn
  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${var.ecr_repository_url}:latest"
      essential = true
      command = [
        "uvicorn",
        "services.api.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
      ]

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "api"
        }
      }

      environment = [
        {
          name  = "NATS_URL"
          value = local.nats_url
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        }
      ]

      secrets = [
        {
          name      = "POSTGRES_USER"
          valueFrom = "${var.db_secret_arn}:username::"
        },
        {
          name      = "POSTGRES_PASSWORD"
          valueFrom = "${var.db_secret_arn}:password::"
        },
        {
          name      = "POSTGRES_DB"
          valueFrom = "${var.db_secret_arn}:dbname::"
        },
        {
          name      = "POSTGRES_HOST"
          valueFrom = "${var.db_secret_arn}:host::"
        },
        {
          name      = "POSTGRES_PORT"
          valueFrom = "${var.db_secret_arn}:port::"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api"
  cluster         = aws_ecs_cluster.ecs.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.api_target_group_arn
    container_name   = "api"
    container_port   = 8000
  }
}
