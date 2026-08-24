import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/constants/api_endpoints.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = true;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _currentUser != null;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    checkAuthSession();
  }

  Future<void> checkAuthSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final token = await StorageService.getToken();
      if (token == null) {
        _isLoading = false;
        notifyListeners();
        return;
      }

      final res = await ApiService.get(ApiEndpoints.me);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['user'] != null) {
          _currentUser = UserModel.fromJson(data['user']);
        }
      } else {
        await StorageService.clearToken();
        _currentUser = null;
      }
    } catch (e) {
      print('Check session error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String usernameOrEmail, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(ApiEndpoints.login, {
        'usernameOrEmail': usernameOrEmail,
        'password': password,
      });

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['token'] != null) {
        await StorageService.saveToken(data['token']);
        _currentUser = UserModel.fromJson(data['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['error'] ?? 'Invalid credentials';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection failed. Please check server.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String username,
    required String displayName,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.post(ApiEndpoints.register, {
        'username': username,
        'displayName': displayName,
        'email': email,
        'password': password,
      });

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['token'] != null) {
        await StorageService.saveToken(data['token']);
        _currentUser = UserModel.fromJson(data['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['error'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Connection failed. Please check server.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post(ApiEndpoints.logout, {});
    } catch (_) {}
    await StorageService.clearToken();
    _currentUser = null;
    notifyListeners();
  }
}
