import { Tabs } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart3,
  Bell,
  Calendar,
  User
} from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { role } = useAuth();
  const { colors } = useTheme();
  const isStudent = role === 'student';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBarBg, borderTopColor: colors.border }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Mark Att.',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />

      {/* Faculty Only Tabs */}
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          href: isStudent ? null : '/students',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: isStudent ? null : '/reports',
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }}
      />

      {/* Common Tabs */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Notices',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      {/* Hidden Routes (Not shown in Tab Bar) */}
      <Tabs.Screen
        name="face-training"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  tabItem: {
    padding: 0,
    minWidth: 50,
  }
});
