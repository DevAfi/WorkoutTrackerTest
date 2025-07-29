import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useNavigation } from "@react-navigation/native";

export default function profileSettings({ session }: { session: Session }) {
  
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [goal, setgoal] = useState('')
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    getProfile()
    if (session) {
      console.log('Session found')
    } else {
      console.warn('No session found')
    }
  }, [session])

  async function getProfile() {
    console.log('Fetching profile...')
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, goal, avatar_url, full_name`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setgoal(data.goal)
        setAvatarUrl(data.avatar_url)
        setName(data.full_name)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)

    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {

      if (!session?.user) throw new Error('No user on the session!');
      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {

    }
  }

  return (
    
    <View style={styles.container}>
      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Profile</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email || ''} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={setUsername} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Current Fitness Goal" value={goal || ''} onChangeText={setgoal} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Avatar URL" value={avatarUrl || ''} onChangeText={setAvatarUrl} />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={'Update Profile'}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
 
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Return" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});