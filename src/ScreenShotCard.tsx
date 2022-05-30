import { Box, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, TextField } from "@mui/material";
import { Component, useState } from "react";
import styled from "@emotion/styled/types/base";

type ScreenShotCardPropsType = {
    imageBlob: Blob,
}

type ScreenShotCardStateType = {
    isLoaded: boolean,
    text: string,
}

const blobToBase64 = (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
    });
};



export class ScreenShotCard extends Component<ScreenShotCardPropsType, ScreenShotCardStateType> {
    state = {
        isLoaded: false,
        text: '',
    }

    async componentDidMount() {
        const imageBase64 = await blobToBase64(this.props.imageBlob);
        fetch('http://127.0.0.1:5000/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: imageBase64 }),
        })
            .then(res => res.text())
            .then(text => this.setState({ text: text, isLoaded: true }));
    }

    render() {
        return (
            <Card>
                <div style={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        image={URL.createObjectURL(this.props.imageBlob)}
                        style={{ opacity: this.state.isLoaded ? 1 : 0.1 }}
                    />
                    {!this.state.isLoaded ? (
                        <CircularProgress style={{ marginLeft: -20, marginTop: -20, position: 'absolute', top: '50%' }} />) : <div />}
                </div>
                {this.state.isLoaded ? (
                    <div>
                        <CardContent>
                            <TextField fullWidth id="fullWidth" defaultValue={this.state.text} />
                        </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                                Add Image To Anki
                            </Button>
                        </CardActions>
                    </div>
                ) : (<div />)}
            </Card>
        )
    }
}