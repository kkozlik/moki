import React, { useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';

/*
collapse div area

data format: {name:  id, description: titleToDisplay, data: divToExpand}
*/
function CollapseArea(data) {
    const [open, setOpen] = useState(false);
    return (

        <div className="container" key={data.name}>
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                className="noFormatButton"
                id="buttonColor"
                title={data.title}

            >
                {data.name}
                {data.description && <span style={{ "color": "grey" }}>{" - " + data.description}</span>}
            </Button>
            <Collapse in={open}>
                <div id="example-collapse-text" style={{"width": "716px"}}>
                    <div className="card card-body">
                        {data.data}
                    </div>
                </div>
            </Collapse>
        </div>
    );
}



export default CollapseArea;