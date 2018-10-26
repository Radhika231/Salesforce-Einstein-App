import React, {Component} from 'react'
import GrommetApp from 'grommet/components/App';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Button from 'grommet/components/Button';
import Image from 'grommet/components/Image';
import AddCircleIcon from 'grommet/components/icons/base/AddCircle';
import Section from 'grommet/components/Section';
import Notification from 'grommet/components/Notification';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';
import Dropzone from 'react-dropzone';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.onDrop = this.onDrop.bind(this);

    this.state = {
      image: null,
      prediction: null,
      imagePaths: null,
      error: null
    }
  }

  onDrop ([image]) {
    console.log('Received files: ', image);
    this.setState({
      image: image
    });

  const formData = new FormData();
  formData.append('file', image);

    fetch('/file-upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then(err => Promise.reject(err));
      })
      .then((resJson) => {
        this.setState({
          prediction: resJson.bestPrediction,
          imagePaths: resJson.imagePaths,
          error: null
        });
      })
      .catch(error => this.setState({
        prediction: null,
        imagePaths: null,
        error: error
      }));
  }
  render () {
    return (
      <GrommetApp>
        <Header>
          <Title>
            REI Einstein Shopping App
          </Title>
        </Header>
        <div>
          <Dropzone
            onDrop={this.onDrop}
            className="slds-file-selector__dropzone wrap"
            accept="image/jpeg,image/jpg,image/tiff,image/gif"
            multiple={ false } >
               <Button
                 icon={<AddCircleIcon />}
                 label='Visual Search'
               />
               <span className="search-image">
                 {this.state.image &&
                   <Image src={this.state.image.preview} size="thumb" />}
               </span>
           </Dropzone>
         </div>
           {this.state.prediction &&
             <Section>
               Category:&nbsp;{this.state.prediction.label}
             </Section>
           }
           <Columns>
             {this.state.imagePaths && Object.values(this.state.imagePaths).map((imagePath) =>
               (
                 <Box align="center"
                   pad="medium"
                   margin="small"
                   colorIndex="light-2"
                   className="img-result">
                   <Image src={`data:image/jpeg;base64,${imagePath}`} size="medium"/>
                 </Box>
               ))
             }
           </Columns>
           {this.state.error &&
              <Notification
                message='Invalid access token. Please try again.'
                status='warning' />
           }
      </GrommetApp>
    );
  }
}
