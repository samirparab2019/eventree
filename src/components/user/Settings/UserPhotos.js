import React, { Fragment } from "react";
import { Header, Card, Image, Button } from "semantic-ui-react";

const UserPhotos = ({
  photos,
  profile,
  deletePhoto,
  setMainPhoto,
  loading
}) => {
  let filteredPhotos;
  if (photos) {
    filteredPhotos = photos.filter(photo => {
      return photo.url !== profile.photoURL;
    });
  }
  return (
    <Fragment>
      <Header sub color="purple" content="All Photos" />

      <Card.Group itemsPerRow={5}>
        <Card>
          <Image src={profile.photoURL || "/assets/user.png"} />
          <Button color="purple">Main Photo</Button>
        </Card>
        {photos &&
          filteredPhotos.map(photo => (
            <Card key={photo.id}>
              <Image src={photo.url} />
              <div className="ui two buttons">
                <Button
                  loading={loading}
                  onClick={() => setMainPhoto(photo)}
                  positive
                >
                  Main
                </Button>

                <Button
                  style={{ textAligh: "center" }}
                  loading={loading}
                  onClick={() => deletePhoto(photo)}
                  icon="trash"
                  color="red"
                />
              </div>
            </Card>
          ))}
      </Card.Group>
    </Fragment>
  );
};

export default UserPhotos;
