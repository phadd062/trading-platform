variable "region" {
    type = string
    default = "us-east-1"
}

variable "project_name" {
    type = string
    default = "trading-platform"
}

variable "vpc_cidr" {
    type = string
    default = "10.16.0.0/16"
}
