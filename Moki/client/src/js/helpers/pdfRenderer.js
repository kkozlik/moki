import React from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import ReactDOM from 'react-dom';
import { PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
	flexDirection: 'row',
	backgroundColor: '#E4E4E4'
  },
  section: {
	margin: 10,
	padding: 10,
	flexGrow: 1
  }
});

// Create Document Component
// {document.getElementById("context")}
/*const MyDocument = () => (
  <Document>
	<Page size="A4" style={styles.page}>
	  <View style={styles.section}>
        {document.getElementById("context")}
	  </View>
	</Page>
  </Document>
);

*/
class renderPDF extends React.Component {
  state = { url: null };

  onRender = ({ blob }) => {
    this.setState({ url: URL.createObjectURL(blob) });
  };

  render() {
    return (
		<div> <button type="button" className="btn btn-default" onClick={this.renderPdf} >
			<PDFDownloadLink
				document={this.props.document}
				fileName="monitor.pdf">
					{({ blob, url, loading, error }) => (
		   				loading ? 'Loading...' : 'download pdf'
	   				)}
			</PDFDownloadLink>
            </button>
		</div>
    );
  }
}

export default renderPDF;
