const visOptions = { 
    physics: false, 
    height: "100%", 
    width: "100%",
    nodes: {
        chosen: false,
        shape: 'box',
        labelHighlightBold: false,
        shapeProperties: {
            borderRadius: 0
        },
        borderWidth: 1,
        borderWidthSelected: 1,
        color: {
            border: '#6495ED',
            background: '#4444AD',
            highlight: '#6495ED',
            hover: '#6495ED'
        },
        font: {
            color: 'white',
            size: 15,
            face: '"Helvetica Neue", Helvetica, Arial, sans-serif'
        },
        widthConstraint: {
            minimum: 25,
            maximum: 150
        }
    },
    edges: {
        labelHighlightBold: false,
        width: 1,
        color: {
            color: 'black',
            highlight: 'black',
            hover: 'black'
        },
        font: {
            color: 'black',
            size: 15,
            face: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            strokeWidth: 8,
            strokeColor: 'white',
            background: 'white'
        },
        selectionWidth: 0,
        smooth: false,
        length: 150
    } 
};

export default visOptions;