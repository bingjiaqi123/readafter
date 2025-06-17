import { useState, useMemo, useEffect } from 'react';

interface ReadList {
  id: string;
  name: string;
  schemes: Array<{
    schemeId: string;
    noteId: string;
    order: number;
  }>;
}

interface Scheme {
  id: string;
  text: string;
  noteTitle: string;
}

interface RepeatDialogProps {
  listId: string;
  onClose: () => void;
  readLists: ReadList[];
  allSchemes: Scheme[];
}

export function RepeatDialog({ 
  listId, 
  onClose, 
  readLists, 
  allSchemes 
}: RepeatDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPromptEnabled, setIsPromptEnabled] = useState(true);
  const [pausedState, setPausedState] = useState<{
    schemeIndex: number;
    segmentIndex: number;
  } | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // 检测语音合成支持
  useEffect(() => {
    const checkSpeechSupport = () => {
      if (!window.speechSynthesis) {
        setSpeechSupported(false);
        setSpeechError('您的浏览器不支持语音合成功能');
        return;
      }

      // 检测移动端
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // 移动端特殊处理
        console.log('检测到移动端设备');
        
        // 移动端可能需要用户交互才能播放语音
        // 这里可以添加移动端特定的初始化逻辑
      }

      // 测试语音合成是否可用
      try {
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.lang = 'zh-CN';
        // 不实际播放，只测试创建是否成功
      } catch (error) {
        setSpeechSupported(false);
        setSpeechError('语音合成功能初始化失败');
        console.error('语音合成初始化错误:', error);
      }
    };

    checkSpeechSupport();
  }, []);

  // 移动端语音播放优化
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 确保语音合成在移动端正常工作
  const ensureSpeechSynthesisReady = () => {
    if (isMobile && window.speechSynthesis) {
      // 移动端可能需要先取消所有语音
      window.speechSynthesis.cancel();
      
      // 等待一小段时间确保状态重置
      return new Promise(resolve => setTimeout(resolve, 100));
    }
    return Promise.resolve();
  };

  // 获取当前列表的所有方案
  const currentList = useMemo(() => {
    console.log('Current listId:', listId);
    console.log('Available lists:', readLists);
    return readLists.find(list => list.id === listId);
  }, [listId, readLists]);

  // 获取当前列表的所有方案
  const schemes = useMemo(() => {
    if (!currentList) {
      console.log('No current list found');
      return [];
    }

    console.log('Current list:', currentList);
    console.log('All schemes:', allSchemes);

    const sortedSchemes = currentList.schemes
      .sort((a, b) => a.order - b.order)
      .map(scheme => {
        const found = allSchemes.find(s => s.id === scheme.schemeId);
        console.log('Looking for scheme:', scheme.schemeId, 'Found:', found);
        return found;
      })
      .filter((scheme): scheme is Scheme => scheme !== undefined);

    console.log('Sorted schemes:', sortedSchemes);
    return sortedSchemes;
  }, [currentList, allSchemes]);

  // 计算总时长（仅用于显示，实际播放时间会略长）
  const totalDuration = useMemo(() => {
    let totalSegments = 0;
    schemes.forEach(scheme => {
      totalSegments += scheme.text.split('▼').filter(Boolean).length;
    });
    // 假设每段平均2秒，包括重复播放
    const totalSeconds = totalSegments * 2;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return { hours, minutes, seconds };
  }, [schemes]);

  // 修改 playText 函数
  const playText = async (text: string, volume: number = 1) => {
    return new Promise<void>(async (resolve, reject) => {
      if (!speechSupported) {
        reject(new Error('语音合成不支持'));
        return;
      }

      try {
        // 移动端优化：确保语音合成准备就绪
        await ensureSpeechSynthesisReady();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.volume = volume;
        
        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          console.error('语音播放错误:', event);
          setSpeechError(`语音播放失败: ${event.error}`);
          reject(new Error(`语音播放失败: ${event.error}`));
        };
        
        // 移动端特殊处理：确保在用户交互上下文中
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          // 等待一小段时间
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('创建语音合成对象失败:', error);
        setSpeechError('创建语音合成对象失败');
        reject(error);
      }
    });
  };

  // 修改 playDing 函数
  const playDing = async () => {
    return new Promise<void>((resolve) => {
      try {
        const audio = new Audio('/ding.mp3');
        audio.onended = () => resolve();
        audio.onerror = () => {
          console.warn('提示音播放失败，继续执行');
          resolve(); // 提示音失败不影响主流程
        };
        audio.play().catch(() => {
          console.warn('提示音播放被阻止，继续执行');
          resolve(); // 提示音失败不影响主流程
        });
      } catch (error) {
        console.warn('提示音播放出错:', error);
        resolve(); // 提示音失败不影响主流程
      }
    });
  };

  // 处理文本，移除气口标记前的标点
  const processText = (text: string) => {
    return text.replace(/[，。！？、；：（）【】《》](?=▼)/g, '');
  };

  // 修改播放所有内容的函数
  const playAll = async (startFromSchemeIndex: number = 0, startFromSegmentIndex: number = 0) => {
    try {
      for (let i = startFromSchemeIndex; i < schemes.length; i++) {
        const scheme = schemes[i];
        const segments = scheme.text.split('▼').filter(Boolean);
        
        // 如果是起始方案，从指定的段落开始
        const startSegment = i === startFromSchemeIndex ? startFromSegmentIndex : 0;
        
        for (let j = startSegment; j < segments.length; j++) {
          const text = segments[j];
          setCurrentText(text);
          setCurrentIndex(i);
          setCurrentSegmentIndex(j);

          try {
            // 播放流程：
            // 1. 正常音量播放文本（过滤气口标记前的标点）
            await playText(processText(text));
            // 2. 如果提示音开启，播放提示音
            if (isPromptEnabled) {
              await playDing();
            }
            // 3. 立即开始0音量重复播放文本（不过滤标点）
            await playText(text, 0);
          } catch (error) {
            console.error('播放段落失败:', error);
            // 继续播放下一段，不中断整个流程
            continue;
          }
        }
      }
    } catch (error) {
      console.error('播放过程中出错:', error);
    } finally {
      // 播放完成
      setIsPlaying(false);
      setPausedState(null);
      onClose();
    }
  };

  // 修改开始播放函数
  const handleStart = () => {
    // 确保先停止所有正在播放的内容
    window.speechSynthesis.cancel();
    // 重置状态
    setCurrentIndex(0);
    setCurrentSegmentIndex(0);
    setCurrentText('');
    setPausedState(null);
    // 开始播放
    setIsPlaying(true);
    playAll(0, 0);
  };

  // 修改暂停/继续函数
  const handlePlayPause = () => {
    if (isPlaying) {
      // 暂停时记录当前状态
      window.speechSynthesis.cancel();
      setPausedState({
        schemeIndex: currentIndex,
        segmentIndex: currentSegmentIndex
      });
      setIsPlaying(false);
    } else {
      // 继续时从暂停的状态开始播放
      setIsPlaying(true);
      if (pausedState) {
        playAll(pausedState.schemeIndex, pausedState.segmentIndex);
      } else {
        // 如果没有暂停状态（比如第一次点击继续），从头开始播放
        playAll(0, 0);
      }
    }
  };

  // 获取播放按钮的文本和点击处理函数
  const getPlayButtonProps = () => {
    if (isPlaying) {
      return {
        text: '暂停',
        onClick: handlePlayPause,
        className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
      };
    }
    if (pausedState) {
      return {
        text: '继续',
        onClick: handlePlayPause,
        className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
      };
    }
    return {
      text: '开始播放',
      onClick: handleStart,
      className: 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
    };
  };

  // 修改完成函数
  const handleComplete = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPausedState(null);
    onClose();
  };

  // 如果当前列表或方案为空，显示错误信息
  if (!currentList || schemes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-red-600 mb-4">加载失败</h3>
          <p className="text-gray-700 mb-4">
            {!currentList 
              ? `找不到ID为 ${listId} 的列表`
              : '列表中没有可用的跟读方案'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  // 如果语音不支持，显示错误信息
  if (!speechSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-red-600 mb-4">语音功能不可用</h3>
          <p className="text-gray-700 mb-4">
            {speechError || '您的浏览器或设备不支持语音合成功能'}
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <p>可能的解决方案：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>尝试使用Chrome、Firefox或Safari浏览器</li>
              <li>确保浏览器已更新到最新版本</li>
              <li>检查浏览器是否允许网站使用语音功能</li>
              <li>在移动端尝试使用桌面模式</li>
            </ul>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // 测试语音功能
                if (window.speechSynthesis) {
                  const testUtterance = new SpeechSynthesisUtterance('测试语音功能');
                  testUtterance.lang = 'zh-CN';
                  testUtterance.onend = () => {
                    alert('语音测试成功！请尝试重新打开跟读功能。');
                  };
                  testUtterance.onerror = () => {
                    alert('语音测试失败，请检查浏览器设置。');
                  };
                  window.speechSynthesis.speak(testUtterance);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              测试语音
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-500">
            预计完成时间：{totalDuration.hours}小时 {totalDuration.minutes}分钟 {totalDuration.seconds}秒
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPromptEnabled}
              onChange={(e) => setIsPromptEnabled(e.target.checked)}
              className="form-checkbox h-4 w-4 text-indigo-600"
            />
            <span className="text-sm text-gray-700">提示音</span>
          </label>
        </div>

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex justify-center space-x-2">
            <button
              onClick={getPlayButtonProps().onClick}
              className={getPlayButtonProps().className}
            >
              {getPlayButtonProps().text}
            </button>
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              完成
            </button>
          </div>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(true);
                playAll(currentIndex - 1, 0);
              }}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded ${
                currentIndex === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              上一张
            </button>
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(true);
                playAll(currentIndex, 0);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              循环本方案
            </button>
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(true);
                playAll(currentIndex + 1, 0);
              }}
              disabled={currentIndex === schemes.length - 1}
              className={`px-4 py-2 rounded ${
                currentIndex === schemes.length - 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              下一张
            </button>
          </div>
        </div>

        {currentText && (
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">当前播放</div>
            <div className="whitespace-pre-wrap">{currentText}</div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {schemes.map((scheme, index) => (
              <div
                key={scheme.id}
                className={`p-4 rounded-lg ${
                  index === currentIndex
                    ? 'bg-indigo-50 border-2 border-indigo-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="text-sm text-gray-500 mb-2">{scheme.noteTitle}</div>
                <div className="whitespace-pre-wrap">{scheme.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 