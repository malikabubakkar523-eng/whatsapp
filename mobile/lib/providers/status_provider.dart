import 'package:flutter/material.dart';
import '../models/status_model.dart';

class StatusProvider extends ChangeNotifier {
  List<StatusModel> _recentUpdates = [];
  StatusModel? _myStatus;
  bool _isLoading = false;

  List<StatusModel> get recentUpdates => _recentUpdates;
  StatusModel? get myStatus => _myStatus;
  bool get isLoading => _isLoading;

  StatusProvider() {
    _loadMockStatus();
  }

  void _loadMockStatus() {
    _recentUpdates = [
      StatusModel(
        id: 's1',
        userId: 'u1',
        userName: 'Emma Watson',
        textContent: 'Golden hour at the beach 🌅🌊',
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        backgroundColor: '#128C7E',
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
        expiresAt: DateTime.now().add(const Duration(hours: 23)),
        viewsCount: 42,
      ),
      StatusModel(
        id: 's2',
        userId: 'u2',
        userName: 'Michael Brown',
        textContent: 'Designing ChatFlow UI with Flutter 🚀',
        backgroundColor: '#00A884',
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        expiresAt: DateTime.now().add(const Duration(hours: 23)),
        viewsCount: 19,
      ),
      StatusModel(
        id: 's3',
        userId: 'u3',
        userName: 'Sarah Wilson',
        textContent: 'Morning workout complete! 💪',
        backgroundColor: '#9333EA',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        expiresAt: DateTime.now().add(const Duration(hours: 22)),
        viewsCount: 56,
      ),
    ];
  }
}
