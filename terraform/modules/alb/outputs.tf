output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "aws_lb_target_group_arn" {
  value = aws_lb_target_group.api.arn
}

output "aws_lb_dns_name" {
  value = aws_lb.main.dns_name
}

output "aws_lb_id" {
  value = aws_lb.main.id
}
