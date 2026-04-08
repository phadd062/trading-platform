variable "project_name" {
  type = string
}

variable "aws_lb_dns_name" {
  type = string
}

variable "aws_lb_id" {
  type = string
}

variable "use_https_to_alb" {
  type    = bool
  default = false
}
