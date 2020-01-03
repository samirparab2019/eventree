import React, { Fragment } from 'react';
import { Segment, Item, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const EventDetailedSidebar = ({ attendees, isHost }) => {
//  isHost= false;
  return (
    <Fragment>
      <Segment
        textAlign='center'
        style={{ border: 'sold' }}
        attached='top'
        secondary
        inverted
        color='purple'
      >
        {attendees && attendees.length}{' '}
        {attendees && attendees.length === 1 ? 'Person' : 'People'} Going
      </Segment>
      <Segment attached>
        <Item.Group divided>
          {attendees &&
            attendees.map(attendee => (
              <Item key={attendee.id} style={{ position: 'relative' }}>
                {attendee.host && (
                  <Label
                    style={{ position: 'relative' }}
                    color='green'
                    horizontal='right'
                    textAlign='right'
                  >
                    Host
                  </Label>
                )}          
                <Item.Image size='tiny' src={attendee.photoURL} />
                <Item.Content verticalAlign='middle'>
                  <Item.Header as='h3'>
                    <Link to={`/profile/${attendee.id}`}>{attendee.displayName}</Link>
                  </Item.Header>
                </Item.Content>
              </Item>
            ))}
        </Item.Group>
      </Segment>
    </Fragment>
  );
};

export default EventDetailedSidebar;