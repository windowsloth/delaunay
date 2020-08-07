function quicksort(arr, start, end) {
  if (start >= end) {
    return;
  }
  let index = partition(arr, start, end);
  quicksort(arr, start, index - 1);
  quicksort(arr, index + 1, end);
}

function partition(arr, start, end) {
  let pivotval = arr[end];
  let pivotindex = start;
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotval) {
      swap(arr, i, pivotindex);
      pivotindex++;
    }
  }
  swap(arr, end, pivotindex);
  return pivotindex;
}

function swap (arr, a, b) {
  let temp = arr[a];
  arr[a] = arr[b];
  arr[b] = temp;
}
