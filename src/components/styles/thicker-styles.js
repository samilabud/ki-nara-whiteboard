import styled from "styled-components";
export const RangeInputS = styled.input`
  & {
    margin: 10px 0;
    transform: rotate(180deg);
    width: 100px;
    height: 25px; /* Adjust height to control the width of the slider */
    -webkit-appearance: none;
    background-color: #f0f0e9;
  }
  &:focus {
    outline: none;
  }
  &::-webkit-slider-runnable-track {
    position: relative;
    width: 100%;
    height: 4px;
    cursor: pointer;
    animate: 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #555;
    // box-shadow: 0 1px 4px rgb(0 0 0 / 0.5);
  }
  &::-webkit-slider-thumb {
    box-shadow: 0px 1px 4px rgb(0 0 0 / 0.5);
    border: 1px solid #fff;
    border-radius: 45px;
    height: ${({ value }) => value + 2 || 20}px;
    width: ${({ value }) => value + 2 || 20}px;
    background: ${({ thumbcolor }) => thumbcolor || "#232323"};
    cursor: pointer;
    margin-top: ${({ value }) => -value / 2 || -8}px;
    -webkit-appearance: none;
  }
  &:focus::-webkit-slider-runnable-track {
    background: transparent;
  }

  &::-moz-range-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    animate: 0.2s;

    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #555;
  }
  &::-moz-range-thumb {
    box-shadow: 0px 1px 4px rgb(0 0 0 / 0.5);
    border: 1px solid #fff;
    border-radius: 45px;
    height: ${({ value }) => value + 2 || 20}px;
    width: ${({ value }) => value + 2 || 20}px;
    background: ${({ thumbcolor }) => thumbcolor || "#232323"};
    cursor: pointer;
    margin-top: ${({ value }) => -value / 2 || -8}px;
  }

  &::-ms-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
  &::-ms-fill-lower {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #555;
  }
  &::-ms-fill-upper {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #555;
  }
  &::-ms-thumb {
    box-shadow: 0px 1px 4px rgb(0 0 0 / 0.5);
    border: 1px solid #fff;
    border-radius: 45px;
    height: ${({ value }) => value + 2 || 20}px;
    width: ${({ value }) => value + 2 || 20}px;
    background: ${({ thumbcolor }) => thumbcolor || "#232323"};
    cursor: pointer;
    margin-top: ${({ value }) => -value / 2 || -8}px;
  }
  &:focus::-ms-fill-lower {
    background: transparent;
  }
  &:focus::-ms-fill-upper {
    background: transparent;
  }
`;
