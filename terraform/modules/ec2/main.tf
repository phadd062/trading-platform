resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "EC2 instance security group"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "ec2_sg_ingress_rule" {
  security_group_id            = aws_security_group.ec2.id
  from_port                    = 22
  to_port                      = 22
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.vpcendpointec2ssh.id
}

resource "aws_vpc_security_group_egress_rule" "ec2_sg_egress_rule" {
  security_group_id = aws_security_group.ec2.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_security_group" "vpcendpointec2ssh" {
  name        = "${var.project_name}-vpcendpointec2ssh-sg"
  description = "VPC Endpoint security group"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_egress_rule" "vpcendpointec2ssh_egress_rule" {
  security_group_id            = aws_security_group.vpcendpointec2ssh.id
  from_port                    = "22"
  to_port                      = "22"
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ec2.id
}

resource "aws_ec2_instance_connect_endpoint" "ec2" {
  subnet_id          = var.private_db_subnet_id
  security_group_ids = [aws_security_group.vpcendpointec2ssh.id]
}
