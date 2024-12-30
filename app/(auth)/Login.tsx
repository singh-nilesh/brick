import { useSignIn } from '@clerk/clerk-expo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Pressable, Text, Alert } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const login = () => {
	const { signIn, setActive, isLoaded } = useSignIn();

	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const onSignInPress = async () => {
		if (!isLoaded) {
			return;
		}
		setLoading(true);
		try {
			const completeSignIn = await signIn.create({
				identifier: emailAddress,
				password
			});

			// This indicates the user is signed in
			await setActive({ session: completeSignIn.createdSessionId });
		} catch (err: any) {
			alert(err.errors[0].message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Spinner visible={loading} />
			<View style={{ alignItems: 'center', padding: 10 }}>
			<FontAwesome5 name="user-alt" size={130} color="black" />
			</View>
			<TextInput
				autoCapitalize="none"
				placeholder="example@gmail.com"
				value={emailAddress}
				onChangeText={setEmailAddress}
				style={styles.inputField}
			/>
			<TextInput
				placeholder="password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.inputField}
			/>

			<Button onPress={onSignInPress} title="Login" color={'black'}></Button>

			<Link href="/PwReset" asChild>
				<Pressable style={styles.button}>
					<Text>Forgot password?</Text>
				</Pressable>
			</Link>
			<Link href="/Register" asChild>
				<Pressable style={styles.button}>
					<Text>Create Account</Text>
				</Pressable>
			</Link>
		</View>
	);
};

export default login;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 20
	},
	inputField: {
		marginVertical: 4,
		height: 50,
		borderWidth: 1,
		borderColor: 'black',
		borderRadius: 4,
		padding: 10,
		backgroundColor: '#fff'
	},
	button: {
		margin: 8,
		alignItems: 'center'
	}
});