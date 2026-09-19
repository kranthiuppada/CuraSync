import React from 'react';
import { View, SafeAreaView, Platform, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { AppProvider, useApp } from './src/state/AppContext';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import AssistantScreen from './src/screens/AssistantScreen';
import VitalsScreen from './src/screens/VitalsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import CheckinScreen from './src/screens/CheckinScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';

function Shell() {
  const { tab, showProfile } = useApp();
  return (
    <View style={{ flex: 1 }}>
      {showProfile ? (
        <ProfileScreen />
      ) : (
        <>
          <Header />
          <View style={{ flex: 1 }}>
            {tab === 'assistant' && <AssistantScreen />}
            {tab === 'vitals' && <VitalsScreen />}
            {tab === 'reports' && <ReportsScreen />}
            {tab === 'checkin' && <CheckinScreen />}
          </View>
        </>
      )}
      <TabBar />
    </View>
  );
}

function Root() {
  const { colors, mode } = useTheme();
  const { ready, authed } = useAuth();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.canvas }}>
        {!ready ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !authed ? (
          <LoginScreen />
        ) : (
          <AppProvider>
            <Shell />
          </AppProvider>
        )}
      </View>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
