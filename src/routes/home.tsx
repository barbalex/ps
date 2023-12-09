import Typography from '@mui/material/Typography'
import MaterialCard from '@mui/material/Card'
import styled from '@emotion/styled'

const Img = styled.img`
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
`

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`
const ScrollContainer = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  overflow-y: auto;
  /* prevent layout shift when scrollbar appears */
  scrollbar-gutter: stable;
  color: black !important;
`
const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 20px;
  padding: 15px;
  position: relative;
  @media (min-width: 700px) {
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 30px;
    grid-row-gap: 30px;
    padding: 20px;
  }
  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 40px;
    grid-row-gap: 60px;
    padding: 25px;
  }
  @media (min-width: 1700px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 65px;
    grid-row-gap: 90px;
    padding: 25px;
  }
  p {
    margin-bottom: 10px !important;
  }
  p:last-of-type {
    margin-bottom: 0 !important;
    margin-top: 10px !important;
  }
`
const Card = styled(MaterialCard)`
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.711) !important;
  font-weight: 700;
  color: black !important;
  text-shadow: 0 0 1px white;
  ul {
    margin-bottom: 0;
  }
  li:last-of-type {
    margin-bottom: 0;
  }
  li {
    font-weight: 500;
  }
`
const PageTitle = styled(Typography)`
  font-size: 2em !important;
  padding-top: 15px;
  padding-bottom: 0;
  font-weight: 700 !important;
  text-shadow: 2px 2px 3px white, -2px -2px 3px white, 2px -2px 3px white,
    -2px 2px 3px white;
  @media (min-width: 700px) {
    padding-top: 20px;
    padding-bottom: 5;
  }
  @media (min-width: 1200px) {
    padding-top: 25px;
    padding-bottom: 10px;
  }
  @media (min-width: 1700px) {
    padding-top: 30px;
    padding-bottom: 15px;
  }
`
const CardTitle = styled.h3`
  font-weight: 700;
  margin-top: 4px;
`

export const Component = () => <div>Home</div>
