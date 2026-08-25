import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class ModernDotLoader extends StatefulWidget {
  final double size;
  final Color? color;
  final double spacing;

  const ModernDotLoader({
    super.key,
    this.size = 9.0,
    this.color,
    this.spacing = 5.0,
  });

  @override
  State<ModernDotLoader> createState() => _ModernDotLoaderState();
}

class _ModernDotLoaderState extends State<ModernDotLoader> with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (index) {
      return AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      );
    });

    _animations = _controllers.map((controller) {
      return Tween<double>(begin: 0.35, end: 1.0).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeInOut),
      );
    }).toList();

    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 160), () {
        if (mounted) {
          _controllers[i].repeat(reverse: true);
        }
      });
    }
  }

  @override
  void dispose() {
    for (var c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dotColor = widget.color ?? AppColors.primaryGreen;

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _animations[index],
          builder: (context, child) {
            final scale = _animations[index].value;
            return Container(
              margin: EdgeInsets.symmetric(horizontal: widget.spacing / 2),
              width: widget.size * scale,
              height: widget.size * scale,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: dotColor.withOpacity(0.3 + (scale * 0.7)),
                boxShadow: [
                  BoxShadow(
                    color: dotColor.withOpacity(0.4 * scale),
                    blurRadius: 6 * scale,
                    spreadRadius: 1 * scale,
                  ),
                ],
              ),
            );
          },
        );
      }),
    );
  }
}
