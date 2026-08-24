import 'package:flutter/material.dart';
import '../models/call_model.dart';

class CallsProvider extends ChangeNotifier {
  List<CallModel> _calls = [];
  String _activeFilter = 'All'; // All, Missed
  bool _isLoading = false;

  List<CallModel> get calls {
    if (_activeFilter == 'Missed') {
      return _calls.where((c) => c.status == CallStatus.MISSED).toList();
    }
    return _calls;
  }

  bool get isLoading => _isLoading;
  String get activeFilter => _activeFilter;

  CallsProvider() {
    _loadMockInitialCalls();
  }

  void setFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  void _loadMockInitialCalls() {
    _calls = [
      CallModel(
        id: '1',
        conversationId: 'c1',
        callerId: 'u1',
        callerName: 'Emma Watson',
        type: CallType.VIDEO,
        status: CallStatus.INCOMING,
        duration: 144,
        createdAt: DateTime.now().subtract(const Duration(minutes: 25)),
      ),
      CallModel(
        id: '2',
        conversationId: 'c2',
        callerId: 'u2',
        callerName: 'Michael Brown',
        type: CallType.VOICE,
        status: CallStatus.OUTGOING,
        duration: 320,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      CallModel(
        id: '3',
        conversationId: 'c3',
        callerId: 'u3',
        callerName: 'Sarah Wilson',
        type: CallType.VIDEO,
        status: CallStatus.MISSED,
        duration: 0,
        createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      ),
      CallModel(
        id: '4',
        conversationId: 'c4',
        callerId: 'u4',
        callerName: 'Design Team',
        type: CallType.VOICE,
        status: CallStatus.INCOMING,
        duration: 900,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
    ];
  }
}
