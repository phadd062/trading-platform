variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "alb_sg_id" {
  type = string
}

variable "ecr_repository_url" {
  type = string
}

variable "region" {
  type = string
}

variable "db_secret_arn" {
  type = string
}

variable "private_app_subnet_ids" {
  type = list(string)
}

variable "api_target_group_arn" {
  type = string
}
