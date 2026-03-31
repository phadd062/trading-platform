module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = var.vpc_cidr
}

module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
}

module "ecs" {
  source                 = "./modules/ecs"
  project_name           = var.project_name
  vpc_id                 = module.vpc.vpc_id
  alb_sg_id              = module.alb.alb_security_group_id
  ecr_repository_url     = module.ecr.ecr_repository_url
  region                 = var.region
  db_secret_arn          = module.rds.db_secret_arn
  private_app_subnet_ids = module.vpc.private_app_subnet_ids
  api_target_group_arn   = module.alb.aws_lb_target_group_arn
}

module "rds" {
  source                = "./modules/rds"
  project_name          = var.project_name
  vpc_id                = module.vpc.vpc_id
  ecs_sg_id             = module.ecs.ecs_security_group_id
  private_db_subnet_ids = module.vpc.private_db_subnet_ids
  db_name               = var.db_name
  db_username           = var.db_username
  db_instance_class     = "db.t4g.micro"
  debug_db_client_sg_id = var.debug_db_client_sg_id
  ec2_sg_group_id       = module.ec2.ec2_sg_group_id
}

module "ec2" {
  source               = "./modules/ec2"
  project_name         = var.project_name
  private_db_subnet_id = module.vpc.private_db_subnet_ids[0]
  vpc_id               = module.vpc.vpc_id
}

module "alb" {
  source            = "./modules/alb"
  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}
