<script lang="ts">
  let { options, variants } = $props();
  
  let selectedOptions = $state<Record<string, string>>({});
  let selectedVariant = $state<any>(null);

  // Initialize selected options
  $effect(() => {
    if (options && options.length > 0) {
      const initialOptions: Record<string, string> = {};
      options.forEach((option: any) => {
        if (option.values.length > 0) {
          initialOptions[option.id] = option.values[0].value;
        }
      });
      selectedOptions = initialOptions;
      updateSelectedVariant();
    }
  });

  function updateSelectedVariant() {
    if (!variants) return;
    
    const matchingVariant = variants.find((variant: any) => {
      return Object.entries(selectedOptions).every(([optionId, value]) => {
        return variant.options.some((opt: any) => 
          opt.option_id === optionId && opt.value === value
        );
      });
    });

    selectedVariant = matchingVariant || null;
  }

  function handleOptionChange(optionId: string, value: string) {
    selectedOptions = { ...selectedOptions, [optionId]: value };
    updateSelectedVariant();
  }
</script>

{#if options && options.length > 0}
  <div class="space-y-6 mb-8">
    {#each options as option (option.id)}
      <div class="space-y-3">
        <h3 class="text-lg font-semibold text-base-content">{option.title}</h3>
        <div class="flex flex-wrap gap-2">
          {#each option.values as value (value.id)}
            <button
              class="btn btn-outline btn-sm md:btn-md transition-all duration-200 hover:scale-105 {selectedOptions[option.id] === value.value ? 'btn-primary' : ''}"
              on:click={() => handleOptionChange(option.id, value.value)}
              aria-pressed={selectedOptions[option.id] === value.value}
            >
              {value.value}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
