variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "ecs_sg_id" {
  type = string
}

variable "private_db_subnet_ids" {
  type = list(string)
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_instance_class" {
  type = string
}