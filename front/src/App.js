import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Dimmer, Loader, Card } from "semantic-ui-react";

const Container = styled.div`
  width: 85%;
  margin: auto;
  display: grid;
  grid-template-columns: 30% 30% 30%;
  grid-template-rows: auto auto auto;
  row-gap: 35px;
  justify-content:space-evenly;

`;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/")
      .then((response) => response.json())
      .then((products) => {
        setData(products);
        setLoading(false);
      });
  }, []);

  return loading ? (
    <Container>
      <Dimmer active>
        <Loader />
      </Dimmer>
    </Container>
  ) : (
    <Container>
      {data.map(({ url, price,image, name, delivery, _id }) => (
      <a href={url}> <Card
          key={_id}
          image={image}
          header={`Name: ${name}`}
          meta={`Price: ${price}`}
          description={`Delivery: ${delivery}`}
        />
        </a> 
      ))}
    </Container>
  );
};

export default App;
