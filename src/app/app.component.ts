import { Component, ViewChild, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer') viewer: ElementRef;
  wvInstance: WebViewerInstance;
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();
  selectedFile: any

  private documentLoaded$: Subject<void>;

  constructor() {
    this.documentLoaded$ = new Subject<void>();
  }

  ngAfterViewInit(): void {
    this.selectedFile = localStorage.getItem('file');
    WebViewer({
      path: '../lib',
      initialDoc: this.selectedFile ? this.selectedFile : '',
      // initialDoc: '../files/webviewer-demo-annotated.pdf'
    }, this.viewer.nativeElement).then(instance => {
      this.wvInstance = instance;

      // TODO: Set Dark theme
      instance.UI.setTheme('dark')

      // TODO: Add new features in toolbar
      instance.UI.enableFeatures([instance.UI.Feature.Measurement])
      instance.UI.enableFeatures([instance.UI.Feature.FilePicker])
      instance.UI.enableFeatures(['ContentEdit'])

      // TODO: Custom styles
      // const style = instance.UI.iframeWindow.document.documentElement.style;
      // style.setProperty(`--primary-button`, 'red');
      // style.setProperty(`--primary-button-hover`, 'yellow');


      // instance.UI.setToolbarGroup(instance.UI.createToolbarGroup({name: 'opation.'}))
      // instance.Core.ContentEdit

      // TODO: For remove toolbar annotaions
      instance.UI.disableElements(['toolbarGroup-Measure'])

      // TODO: For removing right side commnet panel
      // instance.UI.disableElements(['notesPanel']);/

      this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);

      const { documentViewer, Annotations, annotationManager } = instance.Core;

      // TODO: Comment right side comments panel
      // instance.UI.openElements(['notesPanel']);

      documentViewer.addEventListener('annotationsLoaded', () => {
        // console.log('annotations loaded');
      });



      documentViewer.addEventListener('documentLoaded', (res) => {
        documentViewer.getDocument().getFileData().then(data => {
          const arr = new Uint8Array(data);
          const blob = new Blob([arr], { type: 'application/pdf' });

          //var source = URLObj.createObjectURL(blob);
          //console.log("image source=" + source);

          var reader = new FileReader();
          let file;
          reader.onloadend = function (event) {
            // console.log(event.target.result)
            file = event.target.result
            console.log(file);
            localStorage.setItem('file', file)
          }

          var source = reader.readAsBinaryString(blob);
          // console.log(source);

          // this.selectedFile = source
          // localStorage.setItem('file', source);


        })


        this.documentLoaded$.next();

        // TODO: Comment Custom annotation
        // const rectangleAnnot = new Annotations.RectangleAnnotation({
        //   PageNumber: 1,
        //   // values are in page coordinates with (0, 0) in the top left
        //   X: 100,
        //   Y: 150,
        //   Width: 200,
        //   Height: 50,
        //   Author: annotationManager.getCurrentUser()
        // });
        // annotationManager.addAnnotation(rectangleAnnot);
        // annotationManager.redrawAnnotation(rectangleAnnot);
      });
    })
  }

  ngOnInit() {
  }

  getDocumentLoadedObservable() {
    return this.documentLoaded$.asObservable();
  }


}