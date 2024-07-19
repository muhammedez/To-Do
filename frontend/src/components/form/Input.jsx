import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import isFormInvalid from '../../utils/isFormInvalid.jsx';
import findInputError from '../../utils/findInputError.jsx';


export const Input = ({
  name,
  label,
  type,
  id,
  placeholder,
  validation
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputErrors = findInputError(errors, name);
  const isInvalid = isFormInvalid(inputErrors);

  return (
    <div>
      <div>
        <label htmlFor={id} className='m-2 font-medium text-gray-700'>
          {label}
        </label>
      </div>
      <div>
        <input
          id={id}
          type={type}
          autoComplete="current-password"
          className='form-control rounded-lg border-gray-300'
          placeholder={placeholder}
          {...register(name, validation)}
        />
      </div>
      <div>
        {isInvalid && (
            <InputError
              message={inputErrors.error.message}
              key={inputErrors.error.message}
            />
          )}
        </div>
    </div>
  );
}

const InputError = ({ message }) => {
  return (
    <p className="flex items-center text-red-600">
      <MdError className='inline mr-1 mt-1' />
      {message}
    </p>
  );
}
