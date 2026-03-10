locals {
    availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

resource "aws_vpc" "main_vpc" {
    cidr_block = var.vpc_cidr
    enable_dns_support   = true
    enable_dns_hostnames = true
}

resource "aws_internet_gateway" "main" {
    vpc_id = aws_vpc.main_vpc.id
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id                  = aws_vpc.main_vpc.id
  availability_zone       = local.availability_zones[count.index]
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_app" {
  count = 2
  vpc_id            = aws_vpc.main_vpc.id
  availability_zone = local.availability_zones[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 2)
}

resource "aws_subnet" "private_db" {
  count = 2
  vpc_id            = aws_vpc.main_vpc.id
  availability_zone = local.availability_zones[count.index]
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
}
