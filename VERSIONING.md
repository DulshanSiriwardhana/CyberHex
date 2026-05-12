# Item 144: Semantic Versioning & Release Guidelines

## Versioning Scheme: MAJOR.MINOR.PATCH

### MAJOR (Breaking Changes)
- Incompatible API changes
- C++ engine API changes
- Database schema migrations

### MINOR (New Features)
- Backward-compatible feature additions
- New activation functions
- New optimizers

### PATCH (Bug Fixes)
- Bug fixes
- Performance improvements
- Documentation updates

## Release Process

1. Update version in `package.json` and CMakeLists.txt
2. Update CHANGELOG.md
3. Tag release: `git tag v1.0.0`
4. Push to release branch
5. GitHub Actions runs tests
6. Deploy to production

## Current Version: v1.0.0-stable