import { Component, Input, Renderer2, ViewChild, ElementRef, Output, EventEmitter, Type, AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ImageCropper } from './imageCropper';
import { CropperSettings } from './cropperSettings';
import { Exif } from './exif';
import { Bounds } from './model/bounds';
import { CropPosition } from './model/cropPosition';

@Component({
    selector: 'bb-cropper',
    templateUrl: './imageCropper.html'
})
export class ImageCropperComponent implements AfterViewInit, OnChanges, OnDestroy {

    @ViewChild('cropcanvas', undefined) cropcanvas: ElementRef;
    @ViewChild('selector', undefined) selector: ElementRef;


    @Input() loadNextImage: Subject<any>;
    @Input('settings') public settings: CropperSettings;
    @Input('image') public image: any;
    @Input('inputImage') public inputImage: any;
    @Input() public cropper: ImageCropper;
    @Input() public cropPosition: CropPosition;
    @Output() public cropPositionChange: EventEmitter<CropPosition> = new EventEmitter<CropPosition>();

    @Output() public onCrop: EventEmitter<any> = new EventEmitter();
    @Output() public selectedFileLength: EventEmitter<any> = new EventEmitter();

    private _image_index = new BehaviorSubject<number>(0);


    private pageNum: number;
    @Output() public getPageNum: EventEmitter<any> = new EventEmitter();

    public selectedFiles: any = [];
    public imgIndex: number = 0;

    public croppedWidth: number;
    public croppedHeight: number;
    public intervalRef: number;
    public raf: number;
    public renderer: Renderer2;
    public windowListener: EventListenerObject;

    private isCropPositionUpdateNeeded: boolean;

    constructor(renderer: Renderer2) {
        this.renderer = renderer;
    }

    ngOnInit() {
        this.pageNum = 0;
        this.loadNextImage.subscribe(event => {
            this.next();
        });
    }

    public ngAfterViewInit(): void {
        let canvas: HTMLCanvasElement = this.cropcanvas.nativeElement;

        if (!this.settings) {
            this.settings = new CropperSettings();
        }

        if (this.settings.cropperClass) {
            this.renderer.setAttribute(canvas, 'class', this.settings.cropperClass);
        }

        if (!this.settings.dynamicSizing) {
            this.renderer.setAttribute(canvas, 'width', this.settings.canvasWidth.toString());
            this.renderer.setAttribute(canvas, 'height', this.settings.canvasHeight.toString());
        } else {
            this.windowListener = this.resize.bind(this);
            window.addEventListener('resize', this.windowListener);
        }

        if (!this.cropper) {
            this.cropper = new ImageCropper(this.settings);
        }

        this.cropper.prepare(canvas);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.isCropPositionChanged(changes)) {
            this.cropper.updateCropPosition(this.cropPosition.toBounds());
            if (this.cropper.isImageSet()) {
                let bounds = this.cropper.getCropBounds();
                this.image.image = this.cropper.getCroppedImageHelper().src;
                this.onCrop.emit(bounds);
            }
            this.updateCropBounds();
        }

        if (changes.inputImage) {
            this.setImage(changes.inputImage.currentValue);
        }
    }

    public ngOnDestroy() {
        if (this.settings.dynamicSizing && this.windowListener) {
            window.removeEventListener('resize', this.windowListener);
        }
        this.loadNextImage.unsubscribe();
    }

    public onTouchMove(event: TouchEvent): void {
        this.cropper.onTouchMove(event);
    }

    public onTouchStart(event: TouchEvent): void {
        this.cropper.onTouchStart(event);
    }

    public onTouchEnd(event: TouchEvent): void {
        this.cropper.onTouchEnd(event);
        if (this.cropper.isImageSet()) {
            this.image.image = this.cropper.getCroppedImageHelper().src;
            this.onCrop.emit(this.cropper.getCropBounds());
            this.updateCropBounds();
        }
    }

    public onMouseDown(event: MouseEvent): void {
        this.cropper.onMouseDown(event);
    }

    public onMouseUp(event: MouseEvent): void {
        if (this.cropper.isImageSet()) {
            this.cropper.onMouseUp(event);
            this.image.image = this.cropper.getCroppedImageHelper().src;
            this.onCrop.emit(this.cropper.getCropBounds());
            this.updateCropBounds();
        }
    }

    public onMouseMove(event: MouseEvent): void {
        this.cropper.onMouseMove(event);
    }



    public fileChangeListener($event: any) {
        console.log("fileChangeListener")
        console.log(this.pageNum);
        if ($event.target.files.length === 0) {
            this.selectedFileLength.emit(0);
            return;
        };


        this.pageNum = 0;
        this.imgIndex = 0;
        this.getPageNum.emit(this.pageNum);
        let files = $event.target.files;
        files = [].slice.call(files).filter(function (s) {
            return s.type.includes("image");
        });

        this.selectedFiles = files;
        // console.log(this.selectedFiles);

        if (this.selectedFiles.length === 0) {
            this.selectedFileLength.emit(0);
            return;
        };

        let file: File = this.selectedFiles[0];
        this.selectedFileLength.emit(this.selectedFiles.length);

        if (this.settings.allowedFilesRegex.test(file.name)) {
            let image: any = new Image();
            let fileReader: FileReader = new FileReader();

            fileReader.addEventListener('loadend', (loadEvent: any) => {
                image.addEventListener('load', () => {
                    this.setImage(image);
                });
                image.src = loadEvent.target.result;
            });

            fileReader.readAsDataURL(file);
        }
    }


    next() {

        if (this.selectedFiles.length > 0 && this.imgIndex < (this.selectedFiles.length - 1)) {
            this.imgIndex++;
            this.getSelectedFile(this.imgIndex);
        }
    }

    previous() {

        if (this.imgIndex != 0) {
            this.imgIndex--;
            this.getSelectedFile(this.imgIndex);
        }
    }

    public getSelectedFile(index) {
        // console.log(index);
        this.pageNum = index;

        // console.log('arrow')
        // console.log(this.pageNum)
        this.getPageNum.emit(this.pageNum);
        let file = this.selectedFiles[index];
        console.log('file')
        console.log(file)
        if (this.settings.allowedFilesRegex.test(file.name)) {
            let image: any = new Image();
            let fileReader: FileReader = new FileReader();

            fileReader.addEventListener('loadend', (loadEvent: any) => {
                image.addEventListener('load', () => {
                    this.setImage(image);
                });
                image.src = loadEvent.target.result;
            });

            fileReader.readAsDataURL(file);
        }
    }

    private resize() {
        let canvas: HTMLCanvasElement = this.cropcanvas.nativeElement;
        this.settings.canvasWidth = canvas.offsetWidth;
        this.settings.canvasHeight = canvas.offsetHeight;
        this.cropper.resizeCanvas(canvas.offsetWidth, canvas.offsetHeight, true);
    }

    public reset(): void {
        this.cropper.reset();
        this.renderer.setAttribute(this.cropcanvas.nativeElement, 'class', this.settings.cropperClass);
        this.image.image = this.cropper.getCroppedImageHelper().src;
    }

    public setImage(image: HTMLImageElement, newBounds: any = null) {
        this.renderer.setAttribute(this.cropcanvas.nativeElement, 'class', `${this.settings.cropperClass} ${this.settings.croppingClass}`);
        this.raf = window.requestAnimationFrame(() => {
            if (this.raf) {
                window.cancelAnimationFrame(this.raf);
            }
            if (image.naturalHeight > 0 && image.naturalWidth > 0) {

                image.height = image.naturalHeight;
                image.width = image.naturalWidth;

                window.cancelAnimationFrame(this.raf);
                this.getOrientedImage(image, (img: HTMLImageElement) => {
                    if (this.settings.dynamicSizing) {
                        let canvas: HTMLCanvasElement = this.cropcanvas.nativeElement;
                        this.settings.canvasWidth = canvas.offsetWidth;
                        this.settings.canvasHeight = canvas.offsetHeight;
                        this.cropper.resizeCanvas(canvas.offsetWidth, canvas.offsetHeight, false);
                    }

                    this.cropper.setImage(img);
                    if (this.cropPosition && this.cropPosition.isInitialized()) {
                        this.cropper.updateCropPosition(this.cropPosition.toBounds());
                    }

                    this.image.original = img;
                    let bounds = this.cropper.getCropBounds();
                    this.image.image = this.cropper.getCroppedImageHelper().src;

                    if (!this.image) {
                        this.image = image;
                    }

                    if (newBounds != null) {
                        bounds = newBounds;
                        this.cropper.setBounds(bounds);
                        this.cropper.updateCropPosition(bounds);
                    }
                    this.onCrop.emit(bounds);
                });
            }
        });
    }

    private isCropPositionChanged(changes: SimpleChanges): boolean {
        if (this.cropper && changes['cropPosition'] && this.isCropPositionUpdateNeeded) {
            return true;
        } else {
            this.isCropPositionUpdateNeeded = true;
            return false;
        }
    }

    private updateCropBounds(): void {
        let cropBound: Bounds = this.cropper.getCropBounds();
        this.cropPositionChange.emit(new CropPosition(cropBound.left, cropBound.top, cropBound.width, cropBound.height));
        this.isCropPositionUpdateNeeded = false;
    }

    private getOrientedImage(image: HTMLImageElement, callback: Function) {
        let img: any;

        Exif.getData(image, function () {
            let orientation = Exif.getTag(image, 'Orientation');

            if ([3, 6, 8].indexOf(orientation) > -1) {
                let canvas: HTMLCanvasElement = document.createElement('canvas'),
                    ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d'),
                    cw: number = image.width,
                    ch: number = image.height,
                    cx: number = 0,
                    cy: number = 0,
                    deg: number = 0;

                switch (orientation) {
                    case 3:
                        cx = -image.width;
                        cy = -image.height;
                        deg = 180;
                        break;
                    case 6:
                        cw = image.height;
                        ch = image.width;
                        cy = -image.height;
                        deg = 90;
                        break;
                    case 8:
                        cw = image.height;
                        ch = image.width;
                        cx = -image.width;
                        deg = 270;
                        break;
                    default:
                        break;
                }

                canvas.width = cw;
                canvas.height = ch;
                ctx.rotate(deg * Math.PI / 180);
                ctx.drawImage(image, cx, cy);
                img = document.createElement('img');
                img.width = cw;
                img.height = ch;
                img.addEventListener('load', function () {
                    callback(img);
                });
                img.src = canvas.toDataURL('image/png');
            } else {
                img = image;
                callback(img);
            }
        });
    }
}
