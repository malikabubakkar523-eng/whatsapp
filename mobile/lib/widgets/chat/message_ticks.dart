import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../models/message_model.dart';

class MessageTicks extends StatelessWidget {
  final MessageStatus status;
  final double size;

  const MessageTicks({
    super.key,
    required this.status,
    this.size = 14,
  });

  @override
  Widget build(BuildContext context) {
    if (status == MessageStatus.SENDING) {
      return Icon(Icons.access_time_rounded, size: size, color: AppColors.greyTick);
    }
    if (status == MessageStatus.SENT) {
      return Icon(Icons.check_rounded, size: size, color: AppColors.greyTick);
    }
    if (status == MessageStatus.DELIVERED) {
      return Icon(Icons.done_all_rounded, size: size, color: AppColors.greyTick);
    }
    // READ
    return Icon(Icons.done_all_rounded, size: size, color: AppColors.blueTick);
  }
}
