import { Injectable } from '@angular/core';
import { config } from "src/app/services/config/config";

@Injectable()
export class PdfService {

  private apiEndPoint: string;
  private projectMachineName: string;
  private collectionPdfs: Array<any>;
  private childrenPdfs: Array<any>;

  constructor() {
    this.apiEndPoint = config.app?.apiEndpoint ?? '';
    this.projectMachineName = config.app?.machineName ?? '';
    this.collectionPdfs = config.collectionPdfs ?? [];
    this.childrenPdfs = config.collectionChildrenPdfs ?? [];
  }

  getCollectionChildrenPdfs(collectionID: any) {
    let childrenPdfs = [];
    try {
      childrenPdfs = this.childrenPdfs[collectionID];
    } catch (e) {}
    return childrenPdfs;
  }

  getPdfDetails(facsimileId: string) {
    try {
      for (const collectionId in this.childrenPdfs) {
        for (const pdf of this.childrenPdfs[collectionId]) {
          if (String(pdf.facsimileId) === String(facsimileId)) {
            pdf.pdfUrl = this.urlBase(collectionId) + pdf.pdfFile + '/true';
            return pdf;
          }
        }
      }
      for (const pdf of this.collectionPdfs) {
        if (String(pdf.facsimileId) === String(facsimileId)) {
          pdf.pdfUrl = this.urlBase(pdf.collectionId) + pdf.pdfFile + '/true';
          return pdf;
        }
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  getPdfUrl(facsimileId: any) {
    const pdf = this.getPdfDetails(facsimileId);
    if (pdf) {
      if (pdf.useLocal) {
        return '/assets/sample.pdf';
      }
      return this.urlBase(pdf.collectionId) + pdf.pdfFile.replace('.pdf', '') + '/' + pdf.child;
    }
    return;
  }

  urlBase(collectionId: any) {
    return this.apiEndPoint + '/' + this.projectMachineName + '/files/' + collectionId + '/pdf/';
  }


}
