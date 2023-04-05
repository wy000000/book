'use strict';

//alert("hello");
book.showLeftList();
book.itemClick("《脏腑标本虚实寒热用药式》");

window.onload = function ()
{
    resize();    
};

function resize()
{
    var resize = document.getElementById('resize');
    var left = document.getElementById('left');
    var right = document.getElementById('right');
    var container = document.getElementById('container');
    resize.onmousedown = function (e)
    {
        // 记录鼠标按下时的x轴坐标
        var preX = e.clientX;
        resize.left = resize.offsetLeft;
        document.onmousemove = function (e)
        {
            var curX = e.clientX;
            var deltaX = curX - preX;
            var leftWidth = resize.left + deltaX;
            // 左边区域的最小宽度限制为64px
            if (leftWidth < 64) leftWidth = 64;
            // 右边区域最小宽度限制为64px
            if (leftWidth > container.clientWidth - 64) leftWidth = container.clientWidth - 64;
            // 设置左边区域的宽度
            left.style.width = leftWidth + 'px';
            // 设备分栏竖条的left位置
            resize.style.left = leftWidth;
            // 设置右边区域的宽度
            right.style.width = (container.clientWidth - leftWidth - 4) + 'px';
        }
        document.onmouseup = function (e)
        {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }
}




