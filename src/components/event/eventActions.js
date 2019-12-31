import { FETCH_EVENTS } from "./eventConstants";
import { toastr } from "react-redux-toastr";
import { fetchSampleData } from "../../app/data/mockApi";
import {
  asyncActionStart,
  asyncActionFinish,
  asyncActionError
} from "../async/asyncActions";
import { createNewEvent } from "../../app/common/util/helpers";
import firebase from '../../app/config/firebase';

export const createEvent = event => {
  return async (dispatch, getState, { getFirestore, getFirebase }) => {
    const firestore = getFirestore();
    const firebase = getFirebase();
    const user = firebase.auth().currentUser;
    const photoURL = getState().firebase.profile.photoURL;
    const newEvent = createNewEvent(user, photoURL, event);
    try {
      let createdEvent = await firestore.add("events", newEvent);
      await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
        eventId: createdEvent.id,
        userUid: user.uid,
        eventDate: event.date,
        host: true
      });
      toastr.success("done", "Event has been created");
      return createdEvent;
    } catch (error) {
      console.log(error);
      toastr.error("Fail", "Something went wrong while creating an event");
    }
  };
};

export const updateEvent = event => {
  return async (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    try {
      await firestore.update(`events/${event.id}`, event);
      toastr.success("done", "event updated");
    } catch (error) {
      toastr.error("fail", "try again");
    }
  };
};

export const cancelToggle = (cancelled, eventId) =>
async (dispatch, getState, {getFirestore}) => {
  const firestore = getFirestore();
  try {
await firestore.update(`events/${eventId}`, {
  cancelled: cancelled
})
  } catch (error) {
    console.log(error)
  }
}

export const loadEvents = () => {
  return async dispatch => {
    try {
      dispatch(asyncActionStart());
      const events = await fetchSampleData();
      dispatch({ type: FETCH_EVENTS, payload: { events } });
      dispatch(asyncActionFinish());
    } catch (error) {
      console.log(error);
      dispatch(asyncActionError());
    }
  };
};

export const getEventsForDashboard = () =>
async (dispatch, getState) => {
  let today = new Date()
  const firestore = firebase.firestore();
  const eventsQuery = firestore.collection('events').where('date', '>=', today);

  try {
    dispatch(asyncActionStart())
    let querySnap = await eventsQuery.get()
    let events = [];
    let i = 0;

    for (i = 0; i < querySnap.docs.length; i++) {
      let evt = {...querySnap.docs[i].data(), id: querySnap.docs[i].id};
      events.push(evt);

    }
    dispatch({type: FETCH_EVENTS, payload: {events}})
    dispatch(asyncActionFinish())
  } catch (error) {
    console.log(error)
  dispatch(asyncActionError())
  } 

}
