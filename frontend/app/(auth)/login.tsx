import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Mail,
  Lock,
  Linkedin,
  Github
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen() {
  const { role, setRole, login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const toggleRole = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRole(role === 'student' ? 'faculty' : 'student');
    setEmail('');
    setPassword('');
  };

  const handleAuth = async () => {
    setError('');
    if (isRegistering) {
      if (!fullName || !studentId) {
        setError('Please fill all fields');
        return;
      }
      const { error } = await register(email, password, fullName, studentId);
      if (error) setError(error.message);
    } else {
      const { error } = await login(email, password);
      if (error) setError(error.message);
    }
  };

  const isStudent = role === 'student';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header Logo */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Shield size={32} color="#FFF" fill={Colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.appName}>Attendify</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>

            {/* Top Section: Login Form */}
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>
                {isRegistering ? 'Create Account' : (isStudent ? 'Student Login' : 'Faculty Login')}
              </Text>

              {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}

              {/* Inputs */}
              <View style={styles.inputWrapper}>
                {isRegistering && (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#999"
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Student ID"
                        placeholderTextColor="#999"
                        value={studentId}
                        onChangeText={setStudentId}
                      />
                    </View>
                  </>
                )}
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#CCC" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Lock size={20} color="#CCC" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {!isRegistering && (
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot your password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.signInBtn} onPress={handleAuth} activeOpacity={0.9}>
                <Text style={styles.signInText}>{isRegistering ? 'SIGN UP' : 'SIGN IN'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={{ marginTop: 15 }}>
                <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '600' }}>
                  {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Section: Role Switcher */}
            {!isRegistering && (
              <View style={styles.switchSection}>
                <Text style={styles.switchTitle}>
                  {isStudent ? 'Welcome Faculty!' : 'Welcome Student!'}
                </Text>
                <Text style={styles.switchSubtitle}>
                  Enter your personal details and start your journey with us
                </Text>

                <TouchableOpacity style={styles.switchBtn} onPress={toggleRole} activeOpacity={0.8}>
                  <Text style={styles.switchBtnText}>
                    {isStudent ? 'SIGN IN (FACULTY)' : 'SIGN IN (STUDENT)'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBadge: {
    width: 60,
    height: 60,
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formSection: {
    padding: 30,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 24,
    letterSpacing: 1,
  },
  inputWrapper: {
    width: '100%',
    gap: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 8, // Slight rounded for modern feel, or 0 for strict underline
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  forgotBtn: {
    marginVertical: 16,
  },
  forgotText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  signInBtn: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  switchSection: {
    backgroundColor: Colors.primaryDark,
    padding: 30,
    alignItems: 'center',
    borderTopLeftRadius: 30, // Optional curve effect
    borderTopRightRadius: 30,
    marginTop: -20, // Overlap slightly if desired, or 0
    paddingTop: 40,
  },
  switchTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  switchSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
    maxWidth: '80%',
  },
  switchBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  switchBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
