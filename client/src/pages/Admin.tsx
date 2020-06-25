import React, { useState, ChangeEvent } from 'react';
import { Button, FormGroup, FormControl, Input, InputLabel, Select, MenuItem } from '@material-ui/core';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import styles from './Admin.module.css';

const submitForm = async (values: FormValues) => {
  try {
    const postBody = {
      ...values,
      startTimestamp: values.startDateTime && Math.round(values.startDateTime.getTime() / 1000),
    };
    const response = await fetch('/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    });
    
    if (response.status === 401) {
      alert('Incorrect password, try again');
    }
  } catch (err) {
    console.error(err);
  }
};

interface FormValues {
  serviceName: 'mandarin' | 'asia';
  src: string;
  startDateTime: Date | null;
  password: string;
}

const Admin = () => {
  const [values, setValues] = useState<FormValues>({
    serviceName: 'mandarin',
    src: '',
    startDateTime: null,
    password: '',
  });
  const changeFormValueOf = (prop: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>) =>
      setValues({ ...values, [prop]: event.target.value });

  return (
    <FormGroup className={styles.adminForm}>
      <FormControl>
        <InputLabel htmlFor="service-name">Service Name</InputLabel>
        <Select
          id="service-name"
          value={values.serviceName}
          onChange={changeFormValueOf('serviceName')}
        >
          <MenuItem value="mandarin">Mandarin</MenuItem>
          <MenuItem value="asia">Asia</MenuItem>
        </Select>
      </FormControl>
      <FormControl className={styles.adminFormControl}>
        <InputLabel htmlFor="cloudflare-src">Cloudflare Source</InputLabel>
        <Input id="cloudflare-src" onChange={changeFormValueOf('src')} value={values.src} />
      </FormControl>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateTimePicker
          autoOk
          ampm
          onChange={event => {
            setValues({ ...values, startDateTime: event });
          }}
          label="Service Start Time"
          value={values.startDateTime}
        />
      </MuiPickersUtilsProvider>
      <FormControl className={styles.adminFormControl}>
        <InputLabel htmlFor="password">Admin Password</InputLabel>
        <Input
          id="password"
          onChange={changeFormValueOf('password')}
          type="password"
          value={values.password}
        />
      </FormControl>
      <Button color="primary" onClick={() => submitForm(values)}>
        Submit
      </Button>
    </FormGroup>
  );
};

export default Admin;
