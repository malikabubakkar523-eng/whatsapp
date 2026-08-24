enum CallType { VOICE, VIDEO }
enum CallStatus { INCOMING, OUTGOING, MISSED, COMPLETED, REJECTED }

class CallModel {
  final String id;
  final String conversationId;
  final String callerId;
  final String callerName;
  final String? callerAvatar;
  final CallType type;
  final CallStatus status;
  final int duration;
  final DateTime createdAt;

  CallModel({
    required this.id,
    required this.conversationId,
    required this.callerId,
    required this.callerName,
    this.callerAvatar,
    this.type = CallType.VOICE,
    this.status = CallStatus.COMPLETED,
    this.duration = 0,
    required this.createdAt,
  });

  factory CallModel.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type']?.toString().toUpperCase() ?? 'VOICE';
    final statusStr = json['status']?.toString().toUpperCase() ?? 'COMPLETED';

    CallType type = typeStr == 'VIDEO' ? CallType.VIDEO : CallType.VOICE;
    CallStatus status = CallStatus.COMPLETED;
    if (statusStr == 'MISSED') status = CallStatus.MISSED;
    if (statusStr == 'INCOMING') status = CallStatus.INCOMING;
    if (statusStr == 'OUTGOING') status = CallStatus.OUTGOING;
    if (statusStr == 'REJECTED') status = CallStatus.REJECTED;

    return CallModel(
      id: json['id'] ?? '',
      conversationId: json['conversationId'] ?? '',
      callerId: json['callerId'] ?? '',
      callerName: json['callerName'] ?? 'Contact',
      callerAvatar: json['callerAvatar'],
      type: type,
      status: status,
      duration: json['duration'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
