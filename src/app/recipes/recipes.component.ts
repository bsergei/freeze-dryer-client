import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DrawIoDecoder } from './model/draw-io-decoder';
import { MxGraphReader as MxGraphHelper } from './model/mx-graph-helper';
import { FdWorkflowReader } from './model/fd-workflow-reader';

@Component({
    selector: 'recipes',
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

    @ViewChild('graphContainer') graphContainer: ElementRef;

    constructor() {
    }

    ngOnInit(): void {
        const decoder = new DrawIoDecoder();
        const mxGraphHelper = new MxGraphHelper();

        // tslint:disable-next-line:max-line-length
        const mxGraphXml = decoder.decodeToMxGraphAsXml('<mxfile modified="2019-06-27T12:48:43.469Z" host="www.draw.io" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36" etag="NCkzATl_OsRadm3Rm04-" version="10.8.1" type="device"><diagram id="6a731a19-8d31-9384-78a2-239565b7b9f0" name="Page-1">7VpRb5s6FP41kbaHRYATCI9N262adrVKqXZvnyYXHPBqcK4xTdJfPwOHADFpqRrSpCovsY9tsM/3nc8HnAE6j1bfBF6E/3CfsIFl+KsBuhhYlonckfrJLOvC4oycwhAI6kOnyjCjjwSMBlhT6pOk0VFyziRdNI0ej2PiyYYNC8GXzW5zzppPXeCAaIaZh5lu/Zf6MgSrabtVwxWhQQiPnliwvjvs3QeCpzE8b2CheX4VzREu7wULTULs82XNhC4H6FxwLotStDonLPNt6bZi3NcdrZt5CxLLLgOsYsADZiksPZFYSJicXJcOUfNcZMVoFWSID+eML71Q9RxKIiIaY8nFAE3nlLFzzrKyGoW+5peyJ1Lwe1JrMfJr01I6Wa1/qh7gUzX9snfMY1IzX1ChEKc8zptENmw651X3/OamixDYZ7CI7GGhjJgqmqqoOwp890CEJKuaCRz3jfCISLFWXaDVsgFEIHlZXdYYU+Ic1siCwIaBpMHmzhVQqgBYtePmaAh18YHZDgVCtq1BYTb9pdwk1v9lfhyOy+otuDWvXKwatTXUdvo54anwSIOFinkBgV4Xj9JJ3On0zHhMVpejH8nZT/FlPC46Er8RvjpCgjAs6UMzmtv8DUOvOVXT2yCLrCay5jZkxUxh1BZqm2l0ArJ9nRMN3mzJJYwZ63nAY8wuK+s0Vx3ig9+rPj84XwCIf4iUa1BbnEq+BfGKyhrCqnZba6nwzSrrOth90eJJDjxPFvcwZBmhJlmQuS+y8Ls/2eZmGQzfEVbcjMYU1NmLgEKpMg09Hi0ESZI8queYJWTj5aepNq6tDLhZo11FqowHy5BKMlvgHKCl2giaBMJ3CWepJGfCA5Ll1qo2ahX8fUixsxWwbVpstGjxxvgCMVZVQOYFIW072k4rhSq9YZybtSivYn5HnKvKNRFU+YaIV8Z+Xtu+2SsEwekoCGqT27MgdN2tb6zrdTq7ufo+/eWE/988ureCftEJUYTtqSj/YRixBVbfFOmJEW1K7oXEu/8t1Zq39DwzDSWXmF2phSWDLBmxA5m7xDC7aLrzpKbrClyjwu5E3yceTfK8u3Uf6EHFx8bRqXj52nb84Xkk4ux2zdacA4lzWyguMZVmQu7bAjFrmxGPx37yyfzcJfrc95hRIXR0sTj62EB7ilq7/Ob27H5pvVVK1T4d9x0n2Q0+VPTY+wt2d/AnxwW+qYEPKVYq4t8qb9G+aZ5KHmQ7PWpvR+eO37PYHiy0On/o3Pu3q1eh7+jHBKeuqwcA0TGPCkRbB7Guj+UR1SkK5GT09gJpa94lsa+79OMcTUMTbZ2jmUbbu0ZfJ2ntofum7/kv0rZyE9sc0vW+iU1OcxMr513fxHZkhifyjj62ji5PdNBH4DyXD5xa4Dj6i9XOlOFEI6fXBEJVqz/0FKe+1b+m0OVf</diagram></mxfile>');

        const pureMxGraphXml = mxGraphHelper.toPureMxGraphXml(mxGraphXml);
        const svg = mxGraphHelper.toSvg(pureMxGraphXml);
        const containerElement = (this.graphContainer.nativeElement as HTMLElement);
        while (containerElement.firstChild) {
            containerElement.removeChild(containerElement.firstChild);
        }
        containerElement.appendChild(svg);

        const simpleMxGraph = mxGraphHelper.convert(mxGraphXml);
        console.log(simpleMxGraph);

        const fdWfReader = new FdWorkflowReader();
        const wf = fdWfReader.convert(simpleMxGraph);

        console.log(wf);
    }
}
