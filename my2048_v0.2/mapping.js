export default function mapping(value, minIn, maxIn, minOut, maxOut) {
	return (((value - minIn) / (maxIn - minIn)) * (maxOut - minOut)) + minOut;
}