import React, { useState, useContext, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider , useForm } from "react-hook-form"
import { useHttpClient } from '../shared/hooks/http-hook.jsx'
import { AuthContext } from '../shared/context/auth-context.jsx'
import { useAuth } from "../shared/hooks/auth-hook.jsx";
import {
	email_validation,
	password_validation
} from '../utils/inputValidations.jsx'
import { Input }from "../components/form/Input.jsx";
import { BsFillCheckSquareFill } from "react-icons/bs";


const Login = () => {
    const auth = useContext(AuthContext);
	const { login } = useAuth();
	const { sendRequest } = useHttpClient();
	const methods = useForm();
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

    const onSubmit = async data => {
		try {
		  const responseData = await sendRequest(
			'http://localhost:5000/api/users/login',
			'POST',
			JSON.stringify({
			  email: data.email,
			  password: data.password
			}),
			{
			  'Content-Type': 'application/json'
			}
		  );
	
		  startTransition(() => {
			login(responseData.userId, responseData.token); // Call login from useAuth
			methods.reset();
			setSuccess(true);
			navigate('/');
		  });
		} catch (err) {
		}
	  };
	
    return (
        <div className="w-full h-screen flex justify-center items-center">
			<div className='flex flex-row w-auto h-auto p-12 bg-gray-200 items-center justify-center border-gray-900 rounded-xl'>
				<FormProvider {...methods}>
					<form
						onSubmit={methods.handleSubmit(onSubmit)}
						noValidate
					>
						<div>
							<Input {...email_validation} />
							<Input {...password_validation} />
						</div>
						<div className="flex flex-col justify-center mt-3">
							<div className="flex items-center">
								{success && (
									<p className="font-mono">
										<BsFillCheckSquareFill className="inline" /> Logged in successfully!
									</p>
								)}
							</div>
							<button className="btn shadow-md rounded-full bg-green-800 text-white p-2 px-3 m-3 hover:bg-green-500" type='submit'>
								Login
							</button>
						</div>
					</form>
				</FormProvider>
			</div>
        </div>
  );
}

export default Login;
