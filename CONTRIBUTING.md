# 🤝 Contributing to IronLedger

Thank you for your interest in contributing to IronLedger! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that this is a personal project with limited resources
- **Be Professional**: Maintain a professional tone in all communications

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android development)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/DevAfi/WorkoutTrackerTest.git
   cd WorkoutTrackerTest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set Up Environment**
   - Create a `.env` file in the root directory
   - Add your Supabase configuration (contact maintainer for access)
   - Configure any additional environment variables as needed

4. **Start Development Server**
   ```bash
   npm start
   # or
   expo start
   ```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Fixes**: Fix existing issues and improve stability
- ✨ **New Features**: Add new functionality to the app
- 📚 **Documentation**: Improve documentation and code comments
- 🎨 **UI/UX Improvements**: Enhance the user interface and experience
- ⚡ **Performance**: Optimize code and improve app performance
- 🧪 **Testing**: Add tests and improve test coverage

### Before You Start

1. **Check Existing Issues**: Look through existing issues to see if your contribution is already being worked on
2. **Contact Maintainer**: For significant changes, email `amcfdc1@student.le.ac.uk` to discuss your approach
3. **Create an Issue**: For new features or major changes, create an issue first to discuss the implementation

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style and patterns
- Add comments for complex logic
- Update documentation if necessary

### 3. Test Your Changes

```bash
# Run the app to ensure it works
npm start

# Test on both iOS and Android if possible
npm run ios
npm run android
```

### 4. Commit Your Changes

```bash
# Use conventional commit messages
git add .
git commit -m "feat: add new workout template feature"
# or
git commit -m "fix: resolve navigation issue in stats screen"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference any related issues
- Screenshots/videos for UI changes
- Testing instructions

## 📏 Coding Standards

### JavaScript/TypeScript

- Use **TypeScript** for new components and files
- Follow **ESLint** configuration
- Use **functional components** with hooks
- Implement **proper error handling**
- Use **async/await** instead of promises where possible

### React Native

- Use **React Native** best practices
- Implement **proper navigation** patterns
- Use **StyleSheet** for styling
- Follow **component composition** principles
- Implement **proper state management**

### File Structure

```
components/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.styles.ts
│   └── index.ts
```

### Naming Conventions

- **Components**: PascalCase (`WorkoutScreen.tsx`)
- **Files**: camelCase for utilities (`getWorkoutStats.js`)
- **Variables**: camelCase (`userData`, `workoutSession`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### Code Style

```typescript
// ✅ Good
const WorkoutScreen = ({ navigation, route }) => {
  const [workoutData, setWorkoutData] = useState(null);
  
  useEffect(() => {
    fetchWorkoutData();
  }, []);
  
  const handleStartWorkout = async () => {
    try {
      const result = await startWorkout();
      setWorkoutData(result);
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Component JSX */}
    </View>
  );
};

// ❌ Avoid
const workoutScreen = (props) => {
  const [data, setData] = useState(null);
  // Poor naming, no error handling
  return <View>{/* JSX */}</View>;
};
```

## 🧪 Testing

### Manual Testing

Before submitting a PR, please test:

- [ ] App starts without errors
- [ ] Navigation works correctly
- [ ] New features function as expected
- [ ] No regressions in existing functionality
- [ ] UI looks correct on different screen sizes
- [ ] Performance is acceptable

### Testing Checklist

- [ ] Test on both iOS and Android (if possible)
- [ ] Test with different user scenarios
- [ ] Verify error handling works correctly
- [ ] Check for memory leaks or performance issues
- [ ] Ensure accessibility features work

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for complex functions
- Include **inline comments** for non-obvious logic
- Update **README.md** for new features
- Document **API changes** and new endpoints

### Example Documentation

```typescript
/**
 * Starts a new workout session for the current user
 * @param {string} notes - Optional notes for the workout
 * @returns {Promise<string|null>} - Returns workout session ID or null if failed
 */
const startWorkout = async (notes = null) => {
  // Implementation
};
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Device, OS version, app version
4. **Screenshots**: If applicable, include screenshots or videos
5. **Error Messages**: Any error messages or console logs

### Issue Template

```markdown
**Bug Description**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Device: [e.g., iPhone 12, Samsung Galaxy S21]
- OS: [e.g., iOS 15.0, Android 11]
- App Version: [e.g., 1.0.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Guidelines

When requesting features, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Use Cases**: Who would use this and when?
4. **Mockups/Wireframes**: Visual representations if applicable
5. **Alternatives**: Other solutions you've considered

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem**
What problem does this feature solve?

**Proposed Solution**
How should this feature work?

**Use Cases**
- Use case 1
- Use case 2
- Use case 3

**Mockups/Wireframes**
If applicable, add mockups or wireframes.

**Additional Context**
Any other context about the feature request.
```

## 📞 Contact

For questions about contributing or the project:

- **Email**: amcfdc1@student.le.ac.uk
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for general questions

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

## 📄 License

By contributing to IronLedger, you agree that your contributions will be licensed under the same license as the project (0BSD License).

---

Thank you for contributing to IronLedger! Your efforts help make this project better for the entire fitness community. 🏋️‍♂️💪
