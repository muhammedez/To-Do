export  const name_validation = {
    name: 'name',
    label: 'Name',
    type: '',
    id: 'name',
    placeholder: '',
    validation: {
      required: {
        value: true,
        message: 'Required',
      },
      maxLength: {
        value: 30,
        message: '40 characters maximum',
      },
    },
  }
  
  export const password_validation = {
    name: 'password',
    label: 'Password',
    type: 'password',
    id: 'password',
    placeholder: '',
    validation: {
      required: {
        value: true,
        message: 'Required',
      },
      minLength: {
        value: 6,
        message: 'Min 6 characters',
      },
    },
  }

  export const email_validation = {
    name: 'email',
    label: 'Email',
    type: 'email',
    id: 'email',
    placeholder: '',
    validation: {
      required: {
        value: true,
        message: 'Required',
      },
      pattern: {
        value:
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        message: 'not valid',
      },
    },
  }
  