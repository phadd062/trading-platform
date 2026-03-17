module "vpc" {
  source   = "./modules/vpc"
  vpc_cidr = var.vpc_cidr
}

module "ecs" {
  source       = "./modules/ecs"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  alb_sg_id    = module.alb.alb_security_group_id
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
}

module "alb" {
  source       = "./modules/alb"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
}
