output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  value = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  value = module.vpc.private_db_subnet_ids
}

output "alb_security_group_id" {
  value = module.alb.alb_security_group_id
}

output "ecs_security_group_id" {
  value = module.ecs.ecs_security_group_id
}

output "rds_security_group_id" {
  value = module.rds.rds_security_group_id
}

output "ecr_repository_url" {
  value = module.ecr.ecr_repository_url
}

output "ecs_cw_group_name" {
  value = module.ecs.ecs_cw_group_name
}
