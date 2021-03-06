import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import {
  combineValidators,
  composeValidators,
  isRequired,
  hasLengthGreaterThan,
  hasLengthLessThan
} from "revalidate";
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { createEvent, updateEvent, cancelToggle } from "../eventActions";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import SelectInput from "../../../app/common/form/SelectInput";
import PlaceInput from "../../../app/common/form/PlaceInput";
import DateEvent from "../../../app/common/form/EventDate";
import { withFirestore } from "react-redux-firebase";
import { toastr } from "react-redux-toastr";

const google = window.google;

const mapState = (state, ownProps) => {
  const eventId = ownProps.match.params.id;

  let event = {};

  if (
    state.firestore.ordered.events &&
    state.firestore.ordered.events.length > 0
  ) {
    event =
      state.firestore.ordered.events.filter(event => event.id === eventId)[0] ||
      {};
  }
  return {
    initialValues: event,
    event,
    loading: state.async.loading
  };
};
let cancelGoing = event => async (
  dispatch,
  getState,
  { getFirestore, getFirebase }
) => {
  const firestore = getFirestore();
  const firebase = getFirebase();
  const user = firebase.auth().currentUser;
 
  try {
    await firestore.update(`events/${event.id}`, {
      [`attendees`]: firestore.FieldValue.delete(),
      [`hostedBy`]: false
    });
    await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
    toastr.success("done", "Attendees Removed From the Event");
  } catch (error) {
    console.log(error);
    toastr.error("fail", "your are not removed from the attending list");
  }
};

const goingToEvent = event => async (
  dispatch,
  getState,
  { getFirebase, getFirestore }
) => {
  const firestore = getFirestore();
  const firebase = getFirebase();
  const user = firebase.auth().currentUser;
  const profile = getState().firebase.profile;
  try {
    await firestore.update(`events/${event.id}`, {
      [`attendees`]: [`${user.uid}`],
      [`attendees.${user.uid}`]: {
        displayName: event.hostedBy,
        going: true,
        host: true,
        joinDate: new Date(),
        photoURL: event.hostPhotoURL
      },
      [`hostedBy`]: `${profile.displayName}`

    });
    await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
      eventId: event.id,
      userUid: user.uid,
      eventDate: event.date,
      host: true
    });
    toastr.success("done", "Host signed up to the event");
  } catch (error) {
    console.log(error);
    toastr.error("Fail", "Please login to signup for the event");
  }
};

const actions = {
  createEvent,
  updateEvent,
  cancelToggle,
  cancelGoing,
  
  goingToEvent
};

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired({ message: "The category is required" }),
  description: composeValidators(
    isRequired({ message: "Please enter a description" }),
    hasLengthLessThan(250)({
      message: "Description needs to be less than 250 characters"
    }),
    hasLengthGreaterThan(4)({
      message: "Description needs to be at least 5 characters"
    })
  )(),
  city: isRequired("city"),
  venue: isRequired("venue"),
  date: isRequired("date")
});

const category = [
  { key: "Drinks", text: "Drinks", value: "Drinks" },
  { key: "Culture", text: "Culture", value: "Culture" },
  { key: "Film", text: "Film", value: "Film" },
  { key: "Food", text: "Food", value: "Food" },
  { key: "Music", text: "Music", value: "Music" },
  { key: "Travel", text: "Travel", value: "Travel" },
  { key: "Sport", text: "Sport", value: "Sport" },
  { key: "Conference", text: "Conference", value: "Conference" },
  { key: "Family", text: "Family", value: "Family" },
  { key: "Reading", text: "Reading", value: "Reading" },
  { key: "LifeStyle", text: "LifeStyle", value: "LifeStyle" },
  { key: "Dancing", text: "Dancing", value: "Dancing" },
  { key: "Fashion", text: "Fashion", value: "Fashion" }
];

class EventForm extends Component {
  state = {
    cityLatLng: {},
    venueLatLng: {}
  };

  async componentDidMount() {
    const { firestore, match } = this.props;
    await firestore.setListener(`events/${match.params.id}`);
  }

  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`events/${match.params.id}`);
  }

  onFormSubmit = async values => {
    values.venueLatLng = this.state.venueLatLng;
    try {
      if (this.props.initialValues.id) {
        if (Object.keys(values.venueLatLng).length === 0) {
          values.venueLatLng = this.props.event.venueLatLng;
        }
        await this.props.updateEvent(values);
        this.props.history.push(`/events/${this.props.initialValues.id}`);
      } else {
        let createdEvent = await this.props.createEvent(values);
        this.props.history.push(`/events/${createdEvent.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  handleCitySelect = selectedCity => {
    geocodeByAddress(selectedCity)
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          cityLatLng: latlng
        });
      })
      .then(() => {
        this.props.change("city", selectedCity);
      });
  };

  handleVenueSelect = selectedVenue => {
    geocodeByAddress(selectedVenue)
      .then(results => getLatLng(results[0]))
      .then(latlng => {
        this.setState({
          venueLatLng: latlng
        });
      })
      .then(() => {
        this.props.change("venue", selectedVenue);
      });
  };

  render() {
    const {
      history,
      initialValues,
      invalid,
      submitting,
      pristine,
      event,
      cancelToggle,
      loading,
      cancelGoing,
      goingToEvent
    } = this.props;
    return (
      <Grid>
        <Grid.Column width={10}>
          <Segment>
            <Header sub color="purple" content="Event details" />
            <Form
              onSubmit={this.props.handleSubmit(this.onFormSubmit)}
              autoComplete="off"
            >
              <Field
                name="title"
                component={TextInput}
                placeholder="Give your event a name"
              />
              <Field
                name="category"
                component={SelectInput}
                options={category}
                placeholder="What is your event about?"
              />
              <Field
                name="description"
                component={TextArea}
                style={{ overflowWrap: "break-word" }}
                rows={3}
                placeholder="Tell us about your event"
              />
              <Header sub color="purple" content="Event location details" />
              <Field
                name="city"
                component={PlaceInput}
                options={{ types: ["(cities)"] }}
                onSelect={this.handleCitySelect}
                placeholder="Event city"
              />
              <Field
                name="venue"
                component={PlaceInput}
                options={{
                  location: new google.maps.LatLng(this.state.cityLatLng),
                  radius: 1000,
                  types: ["establishment"]
                }}
                onSelect={this.handleVenueSelect}
                placeholder="Event venue"
              />
              <Field
                name="date"
                component={DateEvent}
                dateFormat="dd LLL yyyy h:mm a"
                placeholder="Event date"
                showTimeSelect
                timeFormat="HH:mm"
              />
              <Button
                disabled={invalid || submitting || pristine}
                loading={loading}
                color="purple"
                type="submit"
              >
                Submit
              </Button>
              <Button
                onClick={
                  initialValues.id
                    ? () => history.push(`/events/${initialValues.id}`)
                    : () => history.push("events")
                }
                type="button"
                disabled={loading}
              >
                Cancel
              </Button>
              {event.id && (
                <Button
                  type="button"
                  color={event.cancelled ? "green" : "red"}
                  floated="right"
                  content={
                    event.cancelled ? "Reactivate event" : "Cancel event"
                  }
                  onClick={() => cancelToggle(!event.cancelled, event.id)}
                />
              )}
              {event.id && event.cancelled && (
                <Button
                  type="button"
                  color={event.cancelled && event.attendees ? "red" : "orange"}
                  content={event.attendees ? "Cancel attendees" : "Add host"}
                  onClick={() => {
                    event.cancelled && event.attendees
                      ?  toastr.confirm('Are you sure!! All the attendees will be removed',  { onOk: () => cancelGoing(event),
                        onCancel: () => console.log('CANCEL: clicked')})
                      : goingToEvent(event);
                  }}
                  floated="right"
                />
              )}
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

export default withFirestore(
  connect(
    mapState,
    actions
  )(
    reduxForm({ form: "eventForm", validate, enableReinitialize: true })(
      EventForm
    )
  )
);
