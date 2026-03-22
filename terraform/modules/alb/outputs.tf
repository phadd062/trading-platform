output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "aws_lb_target_group_arn" {
  value = aws_lb_target_group.api.arn
}
