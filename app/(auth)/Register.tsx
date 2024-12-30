import { Button, TextInput, View, StyleSheet } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import Spinner from 'react-native-loading-spinner-overlay';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useState } from 'react';
import { Stack } from 'expo-router';
import React from 'react';

const Register = () => {
	const { isLoaded, signUp, setActive } = useSignUp();

	const [emailAddress, setEmailAddress] = useState('');
	const [password, setPassword] = useState('');
	const [pendingVerification, setPendingVerification] = useState(false);
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);

	const onSignUpPress = async () => {
		if (!isLoaded) {
			return;
		}
		setLoading(true);

		try {
			// Create the user on Clerk
			await signUp.create({
				emailAddress,
				password
			});

			// Send verification Email
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

			// change the UI to verify the email address
			setPendingVerification(true);
		} catch (err: any) {
			alert(err.errors[0].message);
		} finally {
			setLoading(false);
		}
	};

	const onPressVerify = async () => {
		if (!isLoaded) {
			return;
		}
		setLoading(true);

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code
			});

			await setActive({ session: completeSignUp.createdSessionId });
		} catch (err: any) {
			alert(err.errors[0].message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
			<Spinner visible={loading} />

			{!pendingVerification && (
				<>
				<View style={{ alignItems: 'center', padding: 10 }}>
				<FontAwesome5 name="user-plus" size={120} color="black" />
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

					<Button onPress={onSignUpPress} title="Sign up" color={'black'}></Button>
				</>
			)}

			{pendingVerification && (
				<>
					<View>
						<TextInput
							value={code}
							placeholder="Code..."
							style={styles.inputField}
							onChangeText={setCode}
						/>
					</View>
					<Button onPress={onPressVerify} title="Verify Email" color={'black'}></Button>
				</>
			)}
		</View>
	);
};

export default Register;

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