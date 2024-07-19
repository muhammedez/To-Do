import React, { useState, useContext, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider , useForm } from "react-hook-form"
import { useHttpClient } from '../shared/hooks/http-hook.jsx'
import { AuthContext } from '../shared/context/auth-context.jsx'
import {
	name_validation,
	email_validation,
	password_validation
} from '../utils/inputValidations.jsx'
import { Input }from "../components/form/Input.jsx";
import { BsFillCheckSquareFill } from "react-icons/bs";


 const  Register = () => { 
	const auth = useContext(AuthContext);
	const { sendRequest } = useHttpClient();
	const methods = useForm();
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();


	const onSubmit = async data => {
		try {
		  const responseData = await sendRequest(
			'http://localhost:5000/api/users/signup',
			'POST',
			JSON.stringify({
			  name: data.name,
			  email: data.email,
			  password: data.password
			}),
			{
			  'Content-Type': 'application/json'
			}
		  );
	
		  startTransition(() => {
			auth.login(responseData.userId, responseData.token);
			methods.reset();
			setSuccess(true);
			navigate('/');
		  });
		} catch (err) {
			console.error('Error:', err.message || 'An unknown error occurred');
		}
	  };

	return ( 
		<div className="w-full h-screen flex justify-center items-center">
			<div className="flex w-auto h-auto p-12 bg-gray-200 items-center justify-center border border-gray-900 rounded-xl">
				<FormProvider {...methods}>
					<form
						onSubmit={methods.handleSubmit(onSubmit)}
						noValidate
					>
						<div>
							<Input {...name_validation} />
							<Input {...email_validation} />
							<Input {...password_validation} />
						</div>
						<div className=" flex flex-col justify-center mt-3">
							<div>
								{success && (
									<p className="font-mono">
										<BsFillCheckSquareFill className="inline" /> Successfully signed up!
									</p>
								)}
							</div>
							<button className="btn m-3 shadow-md rounded-full bg-green-800 text-white p-2 px-3 hover:bg-green-500" type='submit'>
								Signup
							</button>
						</div>
					</form>
				</FormProvider>
			</div> 
		</div>
	); 
} 

export default Register;
