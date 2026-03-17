resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "RDS Postgres security group"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Postgres from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "random_password" "db_creds" {
  length  = 24
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.private_db_subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-postgres"
  engine                  = "postgres"
  instance_class          = var.db_instance_class
  allocated_storage       = 10
  max_allocated_storage   = 20
  db_name                 = var.db_name
  username                = var.db_username
  password                = random_password.db_creds.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  skip_final_snapshot     = true
  deletion_protection     = false
  multi_az                = false
  backup_retention_period = 5
}

resource "aws_secretsmanager_secret" "db" {
  name = "${var.project_name}/db"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id

  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_creds.result
    dbname   = var.db_name
    host     = aws_db_instance.postgres.address
    port     = aws_db_instance.postgres.port
  })
}
