import React from 'react';
import { Segment, Header, Form, Divider, Label, Button} from 'semantic-ui-react';
import { Field, reduxForm } from 'redux-form';
import { combineValidators, matchesField, isRequired, composeValidators } from 'revalidate';
import TextInput from '../../../app/common/form/TextInput';

const validate = combineValidators({
  newPassword1: isRequired({message: 'please enter new password'}),
  newPassword2: composeValidators(
    isRequired({message: 'please confirm new password'}),
    matchesField('newPassword1')({message: 'Passwords do not match'})
    )()
})

const AccountPage = ({ error, invalid, submitting, handleSubmit, updatePassword }) => {
  return (
    <Segment>
      <Header dividing size="large" content="Account" />
      <div>
        <Header color="purple" sub content="Change password" />
        <p>Update your account settings</p>
        <Form onSubmit={handleSubmit(updatePassword)}>
          <Field
            width={8}
            name="newPassword1"
            type="password"
            pointing="left"
            inline={true}
            component={TextInput}
            basic={true}
            placeholder="New Password"
          />
          <Field
            width={8}
            name="newPassword2"
            type="password"
            inline={true}
            basic={true}
            pointing="left"
            component={TextInput}
            placeholder="Confirm Password"
          />
          {error && (
            <Label basic color="red">
              {error}
            </Label>
          )}
          <Divider />
          <Button disabled={invalid || submitting} size="large" color='purple' content="Update Password" />
        </Form>
      </div>
    </Segment>
  );
};

export default reduxForm({ form: 'account', validate })(AccountPage);