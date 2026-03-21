output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.ecs.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.ecs.arn
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.task_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.task_role.arn
}

output "ecs_cw_group_name" {
  value = aws_cloudwatch_log_group.ecs.name
}
